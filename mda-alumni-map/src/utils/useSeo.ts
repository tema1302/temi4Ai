export function useSeo() {
  const setTitle = (title: string) => {
    document.title = `${title} | Карта выпускников МДА`;
  };

  const setDescription = (desc: string) => {
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);
  };

  return { setTitle, setDescription };
}
