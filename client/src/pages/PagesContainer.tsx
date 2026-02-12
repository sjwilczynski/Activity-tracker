type Props = {
  children: React.ReactNode;
};

export const PagesContainer = ({ children }: Props) => (
  <div className="flex flex-col px-4 py-8 md:px-8">{children}</div>
);
