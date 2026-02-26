import React from "react";
import Image from "next/image";

function Hero() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Top Grid Section */}
        <div className="grid md:grid-cols-2 items-center gap-8">
          <div className="max-w-prose text-left">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              Manage your Expense
              <div>
                <strong className="text-indigo-600">Increase your Money</strong>
              </div>
            </h1>

            <p className="mt-4 text-gray-700 sm:text-lg">
              Lets start with creating your budget and saving your money
            </p>

            <div className="mt-6">
              <a
                className="inline-block rounded border border-indigo-600 bg-indigo-600 px-5 py-3 font-medium text-white hover:bg-indigo-700"
                href="#"
              >
                Get Started
              </a>
            </div>
          </div>

          {/* SVG Image */}
          <div className="flex justify-center">
            <Image src="/1.svg" alt="Illustration" width={500} height={400} />
          </div>
        </div>

        {/* Dashboard Image BELOW and CENTERED */}
        <div className="flex justify-center mt-16">
          <Image
            src="/Dashboard.png"
            alt="Dashboard"
            width={1000}
            height={700}
            className="rounded-xl shadow-xl"
          />
        </div>
      </div>
    </section>
  );
}

export default Hero;
