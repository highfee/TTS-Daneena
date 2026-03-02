/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/tts/:path*",
        destination: "http://localhost:8000/tts/:path*",
      },
      {
        source: "/api/chats/:path*",
        destination: "http://localhost:8000/chats/:path*",
      },
    ]
  },
}

export default nextConfig
