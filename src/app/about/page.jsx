export default function About() {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='max-w-2xl mx-auto p-2 text-center'>
          <div>
            <h1 className='text-3xl font-semibold text-center my-3'>
              About <span className='text-red-600 dark:text-red-500'>PLOT</span><span className='text-blue-600 dark:text-blue-500'>TWIST</span>
            </h1>
            <div className='text-md text-gray-500 flex flex-col gap-6'>
              <p>
                Welcome to <span className='text-red-600 dark:text-red-500 font-semibold'>PLOT</span><span className='text-blue-600 dark:text-blue-500 font-semibold'>TWIST</span>! This app is designed to provide users with the latest movie news and entertainment updates. Our goal is to offer a seamless and enjoyable experience for movie enthusiasts and casual viewers alike.
              </p>
  
              <p>
                On <span className='text-red-600 dark:text-red-500 font-semibold'>PLOT</span><span className='text-blue-600 dark:text-blue-500 font-semibold'>TWIST</span>, you&apos;ll find the latest news articles about movies, TV shows, and entertainment industry updates. We strive to keep our content up-to-date with the latest releases and trending news.
              </p>
  
              <p>
                This website is created using Next.js and modern web technologies.
              </p>
  
              <p>
                We encourage you to rate and review the movies and shows you watch. Your feedback helps other users discover great content and enhances the overall community experience. Join us in celebrating the world of entertainment!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }