import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useSession } from "next-auth/react";
import PropostasPage from "../page";

// Mock next-auth
jest.mock("next-auth/react");

// Mock DashboardHeader component
jest.mock("@/components/DashboardHeader", () => {
  return function MockDashboardHeader() {
    return <div data-testid="dashboard-header">Header</div>;
  };
});

describe("PropostasPage", () => {
  const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

  beforeEach(() => {
    mockUseSession.mockReturnValue({
      data: {
        user: { email: "test@example.com", name: "Test User" },
        expires: "2099-01-01",
      },
      status: "authenticated",
      update: jest.fn(),
    });
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the page with Enviar Proposta card", () => {
    render(<PropostasPage />);
    
    expect(screen.getByText("Propostas")).toBeInTheDocument();
    expect(screen.getByText("Enviar Proposta")).toBeInTheDocument();
    expect(screen.getByText("Iniciar envio")).toBeInTheDocument();
  });

  it("clicking 'Iniciar envio' opens file picker (no navigation)", () => {
    render(<PropostasPage />);
    
    const button = screen.getByText("Iniciar envio");
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    // Mock click on file input
    const clickSpy = jest.spyOn(fileInput, "click");
    
    fireEvent.click(button);
    
    expect(clickSpy).toHaveBeenCalled();
    // Verify we're still on the same page (no navigation)
    expect(screen.getByText("Propostas")).toBeInTheDocument();
  });

  it("validates file type", async () => {
    render(<PropostasPage />);
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    // Try to upload invalid file type
    const invalidFile = new File(["content"], "test.txt", { type: "text/plain" });
    
    fireEvent.change(fileInput, { target: { files: [invalidFile] } });
    
    await waitFor(() => {
      expect(screen.getByText(/Tipo de arquivo inválido/)).toBeInTheDocument();
    });
  });

  it("validates file size", async () => {
    render(<PropostasPage />);
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    // Create a file larger than 10MB
    const largeFile = new File(["x".repeat(11 * 1024 * 1024)], "large.pdf", {
      type: "application/pdf",
    });
    
    fireEvent.change(fileInput, { target: { files: [largeFile] } });
    
    await waitFor(() => {
      expect(screen.getByText(/Arquivo muito grande/)).toBeInTheDocument();
    });
  });

  it("accepts valid PDF file", async () => {
    render(<PropostasPage />);
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    const validFile = new File(["content"], "proposta.pdf", {
      type: "application/pdf",
    });
    
    fireEvent.change(fileInput, { target: { files: [validFile] } });
    
    await waitFor(() => {
      expect(screen.getByText("proposta.pdf")).toBeInTheDocument();
      expect(screen.getByText("Confirmar envio")).toBeInTheDocument();
    });
  });

  it("uploads file successfully", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Success", proposalId: "123" }),
    });

    render(<PropostasPage />);
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    const validFile = new File(["content"], "proposta.pdf", {
      type: "application/pdf",
    });
    
    fireEvent.change(fileInput, { target: { files: [validFile] } });
    
    await waitFor(() => {
      expect(screen.getByText("Confirmar envio")).toBeInTheDocument();
    });
    
    const confirmButton = screen.getByText("Confirmar envio");
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/proposals/upload",
        expect.objectContaining({
          method: "POST",
        })
      );
      expect(screen.getByText(/Proposta enviada com sucesso/)).toBeInTheDocument();
    });
  });

  it("handles upload error", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Upload failed" }),
    });

    render(<PropostasPage />);
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    const validFile = new File(["content"], "proposta.pdf", {
      type: "application/pdf",
    });
    
    fireEvent.change(fileInput, { target: { files: [validFile] } });
    
    await waitFor(() => {
      expect(screen.getByText("Confirmar envio")).toBeInTheDocument();
    });
    
    const confirmButton = screen.getByText("Confirmar envio");
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Upload failed/)).toBeInTheDocument();
    });
  });
});
