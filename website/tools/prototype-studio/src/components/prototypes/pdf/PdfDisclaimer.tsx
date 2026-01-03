interface PdfDisclaimerProps {
  primaryColor: string;
}

export function PdfDisclaimer({ primaryColor }: PdfDisclaimerProps) {
  return (
    <div 
      className="rounded-lg px-4 py-2.5 text-center text-sm"
      style={{
        backgroundColor: `${primaryColor}10`,
        color: primaryColor,
      }}
    >
      This is a prototype demonstration. The final tool would be fully interactive and 
      customizable to your organization's specific workflows.
    </div>
  );
}
