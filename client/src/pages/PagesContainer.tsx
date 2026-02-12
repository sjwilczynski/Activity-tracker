type Props = {
  children: React.ReactNode;
};

export const PagesContainer = ({ children }: Props) => (
  <div className="flex flex-col p-4 sm:p-6">{children}</div>
);
