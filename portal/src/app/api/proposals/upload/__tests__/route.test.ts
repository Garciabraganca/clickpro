import { NextRequest } from "next/server";
import { POST } from "../route";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";

// Mock dependencies
jest.mock("next-auth");
jest.mock("@prisma/client", () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
    },
    proposalDocument: {
      create: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

describe("/api/proposals/upload", () => {
  const mockGetServerSession = getServerSession as jest.MockedFunction<
    typeof getServerSession
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 if user is not authenticated", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const request = new NextRequest("http://localhost:3000/api/proposals/upload", {
      method: "POST",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.message).toBe("Não autenticado");
  });

  it("returns 400 if no file is provided", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: "test@example.com" },
      expires: "2099-01-01",
    });

    const prisma = new PrismaClient();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "user-123",
      email: "test@example.com",
    });

    const formData = new FormData();
    const request = new NextRequest("http://localhost:3000/api/proposals/upload", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe("Nenhum arquivo enviado");
  });

  it("returns 400 for invalid file type", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: "test@example.com" },
      expires: "2099-01-01",
    });

    const prisma = new PrismaClient();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "user-123",
      email: "test@example.com",
    });

    const formData = new FormData();
    const invalidFile = new File(["content"], "test.txt", { type: "text/plain" });
    formData.append("file", invalidFile);

    const request = new NextRequest("http://localhost:3000/api/proposals/upload", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toContain("Tipo de arquivo inválido");
  });

  it("successfully uploads valid PDF file", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: "test@example.com" },
      expires: "2099-01-01",
    });

    const prisma = new PrismaClient();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "user-123",
      email: "test@example.com",
    });

    (prisma.proposalDocument.create as jest.Mock).mockResolvedValue({
      id: "proposal-123",
      userId: "user-123",
      fileName: "proposta.pdf",
      fileSize: 1024,
      fileType: "application/pdf",
      status: "PENDING",
    });

    const formData = new FormData();
    const validFile = new File(["content"], "proposta.pdf", {
      type: "application/pdf",
    });
    formData.append("file", validFile);

    const request = new NextRequest("http://localhost:3000/api/proposals/upload", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe("Proposta enviada com sucesso");
    expect(data.proposalId).toBe("proposal-123");
    expect(prisma.proposalDocument.create).toHaveBeenCalled();
  });
});
