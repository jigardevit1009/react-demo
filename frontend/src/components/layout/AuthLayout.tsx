import { ReactNode } from "react";

interface AuthLayoutProps {
  /** Heading area (title, subtitle, icon) */
  header: ReactNode;
  /** Footer area below the divider (links back / to other auth pages) */
  footer?: ReactNode;
  children: ReactNode;
}

/** Centered card used by Login, Register and Forgot Password pages. */
function AuthLayout({ header, footer, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-3.5 sm:p-6 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xl p-5 sm:p-8 transition-colors">
        <div className="text-center mb-6">{header}</div>

        {children}

        {footer && (
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthLayout;
