// Clerk theming for the sign-in and sign-up pages. Clerk's CSS is placed in the "clerk" cascade layer
// (declared in app/globals.css), so the Tailwind classes below always win over Clerk's defaults.
export const clerkAppearance = {
  cssLayerName: 'clerk',
  variables: {
    colorPrimary: '#6B63C9',
    colorText: '#0E1726',
    colorTextSecondary: '#5B677A',
    colorInputText: '#0E1726',
    colorInputBackground: '#FFFFFF',
    borderRadius: '10px',
    fontFamily: 'var(--font-body), Arial, sans-serif',
    fontFamilyButtons: 'var(--font-body), Arial, sans-serif',
  },
}

// Applied per component so the UserButton menu and the account page keep Clerk's normal card.
export const authElements = {
  rootBox: 'w-full',
  cardBox: 'w-full max-w-none rounded-none border-0 bg-transparent shadow-none',
  card: 'w-full gap-[18px] border-0 bg-transparent p-0 shadow-none',
  headerTitle: 'font-heading text-[34px] leading-tight font-bold tracking-[-0.02em] text-ink',
  headerSubtitle: 'text-[15px] text-mute',
  socialButtonsBlockButton: 'h-auto rounded-[10px] border border-field bg-white px-6 py-[13px] font-semibold text-ink shadow-none hover:bg-white hover:brightness-95',
  dividerLine: 'bg-[#D5DBE6]',
  dividerText: 'text-sm text-mute',
  formFieldLabel: 'text-sm font-semibold text-ink',
  formFieldInput: 'h-auto rounded-lg border border-field bg-white px-3.5 py-3 shadow-none focus:border-accent',
  formFieldAction: 'text-sm font-semibold text-ink underline',
  formButtonPrimary: 'h-auto rounded-[10px] bg-accent px-6 py-3.5 text-base font-semibold normal-case shadow-none hover:brightness-110',
  footer: 'bg-transparent bg-none',
  footerActionText: 'text-[15px] text-mute',
  footerActionLink: 'font-semibold text-ink underline hover:text-accent',
}

export const clerkLocalization = {
  dividerText: 'or use your email',
  signIn: {
    start: {
      title: 'Welcome back',
      subtitle: 'Log in to download your guides and manage your account.',
      actionText: 'New here?',
      actionLink: 'Create an account',
    },
  },
  signUp: {
    start: {
      title: 'Create your account',
      subtitle: 'It takes a minute. You will not need a card to sign up.',
      actionText: 'Already have an account?',
      actionLink: 'Log in',
    },
  },
}
