import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#080c14] flex flex-col items-center justify-center text-center px-4">
      {/* Background pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #4488ff 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Title */}
      <div className="relative z-10">
        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-gray-200 to-gray-600 mb-2">
          VOID HULK
        </h1>
        <p className="text-sm md:text-base text-gray-500 tracking-[0.5em] uppercase mb-12">
          2.5D Isometric Dungeon Crawler
        </p>

        {/* Tagline */}
        <p className="text-gray-400 max-w-md mx-auto mb-12 leading-relaxed text-sm">
          A derelict ship drifts in the void. Something stirs within its hull.
          You are the last operative. Explore. Fight. Survive.
        </p>

        {/* Play Button */}
        <Link
          href="/play"
          className="inline-block px-12 py-4 bg-blue-950/50 hover:bg-blue-900/60 border border-blue-800/50 hover:border-blue-600/60 rounded-lg text-blue-300 font-bold uppercase tracking-[0.3em] text-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/20"
        >
          Enter the Hulk
        </Link>

        {/* Features */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto text-xs text-gray-500">
          <div>
            <div className="text-gray-400 font-bold mb-1">EXPLORE</div>
            Procedural dungeons with fog of war
          </div>
          <div>
            <div className="text-gray-400 font-bold mb-1">FIGHT</div>
            Dice-based tactical combat
          </div>
          <div>
            <div className="text-gray-400 font-bold mb-1">LOOT</div>
            Weapons, armor & upgrades
          </div>
        </div>
      </div>
    </main>
  );
}
