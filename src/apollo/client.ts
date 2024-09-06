import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.bettermode.com/',  
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_ACCESS_TOKEN}`, 
    },
  }),
  cache: new InMemoryCache(),
});

export default client;