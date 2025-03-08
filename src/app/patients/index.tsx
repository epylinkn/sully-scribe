export default function PatientView() {
  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          {/* Left column content */}
          <h2 className="text-xl font-bold mb-4">Column 1</h2>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          {/* Right column content */}
          <h2 className="text-xl font-bold mb-4">Column 2</h2>
        </div>
      </div>
    </div>
  );
}
