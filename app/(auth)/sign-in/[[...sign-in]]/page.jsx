import { SignIn } from "@clerk/nextjs";
import Image from "next/image";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6">

      <div className="flex flex-col md:flex-row items-center bg-white shadow-2xl rounded-2xl overflow-hidden max-w-5xl w-full">

        {/* Left Side - Image */}
        <div className="md:w-1/2 bg-gray-50 p-8 flex justify-center">
          <Image
            src="/2.webp"
            alt="Illustration"
            width={450}
            height={350}
            className="object-contain"
          />
        </div>

        {/* Right Side - Sign In */}
        <div className="md:w-1/2 p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            welcome!
          </h2>

          <SignIn />

        </div>
      </div>

    </div>
  );
} 