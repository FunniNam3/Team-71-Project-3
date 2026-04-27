"use client";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen text-black">
      {/* 2. Hero Title */}
      <header className="pt-32 pb-10 text-center">
        <h1 className="text-6xl font-serif">Boba shop</h1>
      </header>

      {/* 3. Content Sections */}
      <div className="max-w-5xl mx-auto px-8 space-y-24 pb-20">
        {/* Section: Who are we */}
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h2 className="text-4xl font-semibold mb-4">Who are we</h2>
            <p className="text-lg leading-relaxed text-gray-800">
              At The Cool Boba Shop, we’re passionate about crafting
              high-quality bubble tea that brings people together. Founded by a
              group of tea lovers, our goal is to create a welcoming space where
              friends can hang out, study, or just enjoy a refreshing drink. We
              use premium tea leaves, fresh ingredients, and house-made syrups
              to ensure every cup is flavorful and unique. Whether you're a
              longtime boba fan or trying it for the first time, we’re here to
              make your experience memorable.
            </p>
          </div>
          <div className="flex-1 flex justify-center">
            <Image
              src="/Template Image.png"
              alt="Boba tea"
              width={205}
              height={200}
              className="object-contain"
            />
          </div>
        </div>

        {/* Section: Location & Hours (Reversed) */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-12">
          <div className="flex-1">
            <h2 className="text-4xl font-semibold mb-4">Location & Hours</h2>
            <p className="text-lg leading-relaxed text-gray-800">
              You can find us conveniently located in the heart of College
              Station, making us a perfect stop between classes, after work, or
              during a night out. Address: 123 University Drive, College
              Station, TX Hours:
            </p>
            <ul className="list-disc pl-5 indent-4">
              <li>Monday – Thursday: 11:00 AM – 10:00 PM</li>
              <li>Friday – Saturday: 11:00 AM – 12:00 AM</li>
              <li>Sunday: 12:00 PM – 9:00 PM</li>
            </ul>
            <p>
              We offer dine-in, takeout, and online ordering for your
              convenience.
            </p>
          </div>
          <div className="flex-1 flex justify-center">
            <Image
              src="/Template Image.png"
              alt="Boba tea"
              width={205}
              height={200}
              className="object-contain"
            />
          </div>
        </div>

        {/* Section: Types of Products */}
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h2 className="text-4xl font-semibold mb-4">Types of Products</h2>
            <p className="text-lg leading-relaxed text-gray-800">
              We offer a wide variety of drinks and snacks to satisfy every
              craving:
            </p>
            <ul className="list-disc pl-5 indent-4">
              <li>
                Classic Milk Teas: Black, green, and jasmine teas with creamy
                milk and chewy tapioca pearls
              </li>
              <li>
                Fruit Teas: Refreshing blends like mango, strawberry,
                passionfruit, and lychee
              </li>
              <li>
                Specialty Drinks: Brown sugar milk tea, matcha lattes, taro milk
                tea, and seasonal creations
              </li>
              <li>
                Toppings: Tapioca pearls, popping boba, grass jelly, aloe vera,
                and pudding
              </li>
              <li>
                Snacks: Light bites such as mochi, egg waffles, and crispy
                popcorn chicken
              </li>
            </ul>
            <p>
              All drinks are customizable with your choice of sweetness level,
              ice level, and toppings.
            </p>
          </div>
          <div className="flex-1 flex justify-center">
            <Image
              src="/Template Image.png"
              alt="Boba tea"
              width={205}
              height={200}
              className="object-contain"
            />
          </div>
        </div>
      </div>
      {/* menu table with 4 items per row*/}
    </main>
  );
}
