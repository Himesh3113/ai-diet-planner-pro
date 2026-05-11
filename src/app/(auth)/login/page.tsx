import Link from "next/link";
import { login, signInWithGoogle } from "./actions";

export default function LoginPage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-foreground">Welcome back</h3>
        <p className="text-sm text-foreground/60 mt-1">
          Enter your credentials to access your account
        </p>
      </div>

      <form className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground">
            Email address
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none block w-full px-3 py-3 border border-border rounded-xl shadow-sm placeholder-foreground/40 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background/50 backdrop-blur-sm transition-all"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-foreground">
              Password
            </label>
            <div className="text-sm">
              <Link href="/forgot-password" className="font-medium text-primary hover:text-primary/80 transition-colors">
                Forgot your password?
              </Link>
            </div>
          </div>
          <div className="mt-1">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="appearance-none block w-full px-3 py-3 border border-border rounded-xl shadow-sm placeholder-foreground/40 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background/50 backdrop-blur-sm transition-all"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div>
          <button
            formAction={login}
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all active:scale-[0.98]"
          >
            Sign in
          </button>
        </div>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-transparent text-foreground/60 glass rounded-full backdrop-blur-none">
              Or continue with
            </span>
          </div>
        </div>

        <div className="mt-6">
          <form>
            <button
              formAction={signInWithGoogle}
              type="submit"
              className="w-full inline-flex justify-center py-3 px-4 border border-border rounded-xl shadow-sm bg-background/50 text-sm font-medium text-foreground hover:bg-foreground/5 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="ml-2">Google</span>
            </button>
          </form>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-foreground/60">
          Don't have an account?{' '}
          <Link href="/signup" className="font-medium text-primary hover:text-primary/80 transition-colors">
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
}
