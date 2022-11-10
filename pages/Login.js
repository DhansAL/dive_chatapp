import { Button } from '@material-ui/core';
import Head from 'next/head';
import Image from 'next/image';
import styled from 'styled-components';
import { auth, provider } from '../firebase';
import googleIcon from '../public/icons8-google.svg';

function Login() {
  const signIn = () => {
    auth.signInWithPopup(provider).catch(alert);
  };

  return (
    <Container>
      <Head>
        <title>Login | Whatsapp Clone</title>
      </Head>

      <LoginContainer>

        <h1>DIVE CHATAPP</h1>
        <br />
        <Button onClick={signIn} variant="outlined">

          <Image src={googleIcon} alt="Google Icon" width={25} height={25} />
          <ButtonText>SignIn with Google</ButtonText>
        </Button>
      </LoginContainer>

    </Container>
  );
}

export default Login;

const Container = styled.div`
  /* display: grid;
  place-items: center;
  height: 100vh;
  background-color: whitesmoke; */
  display: grid;
  place-items: center;
  height: 100vh;
  background-color: whitesmoke;
  align-content: center;
  justify-items: stretch;
  justify-content: center;
`;

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10rem;
  align-items: center;
  background-color: #fff;
  border-radius: 0.5rem;
  box-shadow: 0px 4px 14px -3px rgba(0, 0, 0, 0.7);
`;

const ButtonText = styled.span`
  margin-left: 1rem;
  font-size: 1.2rem;
  font-family: 'Inter', sans-serif;
`;

const Logo = styled.img`
  height: 20rem;
  width: 20rem;
  margin-bottom: 5rem;
`;

const SocialContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  margin-top: 2rem;
  background-color: #fff;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0px 4px 14px -3px rgba(0, 0, 0, 0.7);
`;
