import Skeleton from '../ui/Skeleton';

const BlogDetailSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 animate-pulse">
      <div className="space-y-4 text-center mx-auto max-w-2xl">
        <Skeleton className="h-4 w-24 mx-auto rounded-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-3/4 mx-auto" />

        <div className="flex justify-center items-center gap-4 pt-4">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>

      <Skeleton className="w-full h-[400px] rounded-3xl shadow-lg" />

      <div className="max-w-2xl mx-auto space-y-6 pt-8">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-64 w-full rounded-xl my-8" />
        <Skeleton className="h-6 w-1/2 mb-4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
};

export default BlogDetailSkeleton;
