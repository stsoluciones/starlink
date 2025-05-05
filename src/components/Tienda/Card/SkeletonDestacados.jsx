const SkeletonDestacado = () => {
  return (
    <li className="relative bg-white border border-gray-200 rounded-lg shadow min-h-48 w-44 md:min-w-60 md:min-h-72 list-none animate-pulse">
      <div className="flex justify-center relative">
        <div className="absolute top-1 right-1 w-8 h-8 bg-gray-300 rounded-full"></div>
        <div className="absolute top-[-15px] left-[-15px] xl:w-14 xl:h-14 w-10 bg-gray-300 rounded-full"></div>
        <div className="rounded-lg overflow-hidden p-1">
          <div className="rounded-lg w-full md:w-48 md:h-48 lg:w-52 lg:h-52 bg-gray-300"></div>
          <div className="absolute bottom-1 right-1 w-16 h-6 bg-gray-300 rounded-md"></div>
        </div>
      </div>
      <div className="px-5 pb-2">
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="flex items-center justify-between gap-2">
          <div className="h-4 bg-gray-300 rounded w-1/3"></div>
          <div className="h-6 bg-gray-300 rounded w-20"></div>
        </div>
      </div>
    </li>
  );
};

export default SkeletonDestacado;
