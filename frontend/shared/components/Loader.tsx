const Loader = () => {
  return (
    <div className="flex flex-1 items-center justify-center" aria-label="Loading" role="status">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
    </div>
  );
};

export default Loader;
