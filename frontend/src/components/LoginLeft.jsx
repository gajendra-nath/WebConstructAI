const LoginLeft = () => {
  return (
    <div
      className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-cover bg-center relative text-white"
      style={{ backgroundImage: "url('/bg-img.png')" }}
    >
      <div className="flex items-center gap-3">
        <img src="/logo.svg" alt="logo" className="w-10 h-10" />
        <span className="text-4xl font-medium text-white">Web Construct</span>
      </div>

      <div>
        <h2 className="text-3xl font-semibold leading-tight mb-3">
          Build your presence on web.
        </h2>
        <p className="text-zinc-300 text-sm max-w-md mb-8">
          Describe your idea in plain English and watch our AI agent architect, code, and deploy a full React website in seconds.
        </p>
        <p className="text-xs text-zinc-400">
          &copy; {new Date().getFullYear()} Web Construct
        </p>
      </div>
    </div>
  )
}

export default LoginLeft