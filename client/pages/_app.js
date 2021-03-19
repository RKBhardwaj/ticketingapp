import 'bootstrap/dist/css/bootstrap.css';
import BaseSerivce from '../api/baseService';
import Header from '../components/header';

const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <>
      <Header currentUser={currentUser} />
      <div className="container">
        <Component currentUser={currentUser} {...pageProps} />
      </div>
    </>
  )
};

AppComponent.getInitialProps = async (appContext) => {
  const client = BaseSerivce(appContext.ctx);
  const { data } = await client.get('/api/users/currentUser');

  let pageProps = {};
  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(appContext.ctx, client, data.currentUser);
  }

  return {
    pageProps,
    ...data
  };
};

export default AppComponent;