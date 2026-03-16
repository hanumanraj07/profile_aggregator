function Loader({ label = "Loading..." }) {
  return (
    <div className="panel flex items-center justify-center py-12">
      <div className="flex items-center gap-3 text-sm text-slate-300">
        <span className="h-3 w-3 animate-ping rounded-full bg-accentBlue" />
        {label}
      </div>
    </div>
  );
}

export default Loader;
