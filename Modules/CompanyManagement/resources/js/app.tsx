import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';

const App = () => {
  const { props } = usePage();
  const companyName = props.company?.name || 'App';

  useEffect(() => {
    document.title = companyName;
  }, [companyName]);

  // ...rest of your app
};
