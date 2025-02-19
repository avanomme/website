export default function SoundPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Sound Bank</h1>
      <div className="bg-gray-100 p-4 rounded-lg">
        <p className="mb-2">FluidR3 General MIDI Sound Bank</p>
        <a
          href="/api/sound"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Download FluidR3_GM.sf2
        </a>
      </div>
    </div>
  );
}
