export function VimLogo({ className }) {
  return (
    <img
      className={className}
      src={`${import.meta.env.BASE_URL}images/vim-logo.svg`}
      alt="Vim 로고"
      width="36"
      height="36"
    />
  );
}
