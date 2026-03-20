import { useState, useEffect } from 'react';

interface UrlParams {
  projectCode: string | null;
  source: 'customer' | 'assessor';
}

export const useUrlParams = (): UrlParams => {
  const [params, setParams] = useState<UrlParams>({
    projectCode: null,
    source: 'customer'
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    
    const projectCode = searchParams.get('project');
    const source = searchParams.get('source') as 'customer' | 'assessor';
    
    setParams({
      projectCode,
      source: source === 'assessor' ? 'assessor' : 'customer'
    });
  }, []);

  return params;
};
