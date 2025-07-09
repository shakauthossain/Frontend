
import { SpeedResult, Recommendation } from '@/types/speed';

export const checkWebsiteSpeed = async (url: string): Promise<SpeedResult> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
  
  // Validate URL format
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  console.log('Checking speed for:', url);

  // Simulate realistic performance metrics
  const loadTime = Math.random() * 3 + 0.5; // 0.5-3.5 seconds
  const firstPaint = loadTime * 0.3; // First paint is typically 30% of load time
  const performanceScore = Math.max(10, Math.min(100, 
    Math.floor(100 - (loadTime - 1) * 20 + Math.random() * 10)
  ));
  
  const pageSizeKB = Math.floor(Math.random() * 2000 + 500); // 500KB - 2.5MB
  const pageSize = pageSizeKB > 1000 
    ? `${(pageSizeKB / 1000).toFixed(1)}MB` 
    : `${pageSizeKB}KB`;

  // Generate realistic recommendations based on performance
  const allRecommendations: Recommendation[] = [
    {
      title: "Optimize Images",
      description: "Compress and resize images to reduce page load time. Consider using WebP format for better compression.",
      impact: 'high'
    },
    {
      title: "Enable Browser Caching",
      description: "Set appropriate cache headers to reduce server requests for returning visitors.",
      impact: 'medium'
    },
    {
      title: "Minify CSS and JavaScript",
      description: "Remove unnecessary characters from code files to reduce their size.",
      impact: 'medium'
    },
    {
      title: "Use Content Delivery Network (CDN)",
      description: "Serve static content from servers closer to your users' geographic location.",
      impact: 'high'
    },
    {
      title: "Reduce Server Response Time",
      description: "Optimize your server configuration and database queries to respond faster.",
      impact: 'high'
    },
    {
      title: "Remove Unused CSS",
      description: "Eliminate unused CSS rules to reduce stylesheet size and improve rendering speed.",
      impact: 'low'
    }
  ];

  // Select recommendations based on performance score
  const numRecommendations = performanceScore < 70 ? 4 : performanceScore < 90 ? 2 : 1;
  const recommendations = allRecommendations
    .sort(() => Math.random() - 0.5)
    .slice(0, numRecommendations);

  const result: SpeedResult = {
    performanceScore,
    loadTime: Math.round(loadTime * 100) / 100,
    firstPaint: Math.round(firstPaint * 100) / 100,
    pageSize,
    recommendations,
    url,
    timestamp: new Date()
  };

  console.log('Speed check result:', result);
  return result;
};
