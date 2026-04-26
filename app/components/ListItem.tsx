import Link from "next/link";

type ListItemProps = {
  title: string;
  description?: string;
  href?: string;
  onClick?: () => void;
};

function ItemBody({ title, description }: Pick<ListItemProps, "title" | "description">) {
  return (
    <>
      <div className="font-medium">{title}</div>
      {description ? <small className="text-black/60">{description}</small> : null}
    </>
  );
}

export default function ListItem({ title, description, href, onClick }: ListItemProps) {
  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-md border border-black/10 bg-white px-3 py-2 text-left hover:bg-black/5"
      >
        <ItemBody title={title} description={description} />
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full rounded-md border border-black/10 bg-white px-3 py-2 text-left hover:bg-black/5"
    >
      <ItemBody title={title} description={description} />
    </button>
  );
}
