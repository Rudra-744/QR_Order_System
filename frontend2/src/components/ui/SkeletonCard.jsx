import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-[var(--color-navy)]/5 flex gap-4">
      <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0">
        <Skeleton height="100%" />
      </div>
      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          <Skeleton width="70%" height={20} className="mb-2" />
          <Skeleton width="100%" height={15} count={2} />
        </div>
        <div className="flex items-center justify-between mt-3">
          <Skeleton width={60} height={20} />
          <Skeleton width={30} height={30} circle />
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
