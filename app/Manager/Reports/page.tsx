export default function MenuBoard() {
  return (
    <main className="min-h-screen bg-black text-white p-10">
      <header className="text-center mb-12">
        <h1 className="text-7xl font-bold uppercase tracking-wider">Menu</h1>
      </header>

      {/* Grid for Menu Items */}
      <div className="grid grid-cols-2 gap-16 max-w-6xl mx-auto">
        <section>
          <h2 className="text-4xl font-semibold mb-6 border-b-2 border-gray-700 pb-2">Drinks</h2>
          <div className="text-3xl space-y-4">
            <div className="flex justify-between">
              <span>Boba Milk Tea</span>
              <span>$5.50</span>
            </div>
            {/* Add more items here */}
          </div>
        </section>

        <section>
          <h2 className="text-4xl font-semibold mb-6 border-b-2 border-gray-700 pb-2">Snacks</h2>
          <div className="text-3xl space-y-4">
            <div className="flex justify-between">
              <span>Popcorn Chicken</span>
              <span>$6.00</span>
            </div>
            {/* Add more items here */}
          </div>
        </section>
      </div>
    </main>
  );
}