const AuthRedirect = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-xl font-semibold">Re-authenticating…</h1>
      <p className="mt-2 text-gray-500">
        Redirecting you to Cloudflare Access login…
      </p>
    </div>
  </div>
)

export default AuthRedirect
