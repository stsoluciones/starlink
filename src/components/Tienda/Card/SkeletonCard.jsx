import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function SkeletonCard() {
  return (
    <div className="relative xs:w-44 sm:w-48 md:w-64 lg:w-56 xl:w-72 lg:h-80 xl:h-96 md:min-h-[290px] lg:min-h-[300px] xl:min-h-[380px] list-none">
      <div className="relative flex flex-col justify-between w-full h-full bg-white border border-gray-200 rounded-lg shadow gap-4">
        <div>
        <div className="md:hidden relative aspect-square">
            <Skeleton height={150} className="rounded-t-lg" />
          </div>
          <div className="hidden md:block xl:hidden relative aspect-square">
            <Skeleton height={200} className="rounded-t-lg" />
          </div>
          <div className="hidden xl:block relative aspect-square">
            <Skeleton height={300} className="rounded-t-lg" />
          </div>
          <div className="px-4 py-1">
            <h2 className="text-sm font-semibold text-gray-900 md:text-base md:font-bold text-center h-10 md:h-5">
              <Skeleton width={`80%`} />
            </h2>
            <p className="text-xs text-gray-700 md:text-base">
              <Skeleton width={`60%`} />
            </p>
            <p className="text-xs text-gray-700 md:text-base">
              <Skeleton width={`50%`} />
            </p>
          </div>
        </div>
        <div className="px-2 pb-1 flex gap-2 justify-center">
          <Skeleton width={`100%`} height={40} className="rounded-lg" />
        </div>
      </div>
    </div>
  );
}