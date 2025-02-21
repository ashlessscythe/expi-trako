import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { APP_NAME } from "@/lib/config";

interface NewUserEmailProps {
  username: string;
  email: string;
}

export function NewUserEmail({ username, email }: NewUserEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>New User Registration in {APP_NAME}</Preview>
      <Body style={main}>
        <Container>
          <Section style={content}>
            <Heading style={header}>
              New User Registration in {APP_NAME}
            </Heading>

            <Text style={paragraph}>
              A new user has registered with the following details:
            </Text>

            <Section style={detailsBox}>
              <Text style={detail}>
                <strong>Username: </strong>{username}
              </Text>
              <Text style={{ ...detail, marginTop: -5 }}>
                <strong>Email: </strong>{email}
              </Text>
            </Section>

            <Text style={paragraph}>
              Please review their account and assign appropriate permissions.
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href="/admin/users">
                Review User
              </Button>
            </Section>

            <Text style={footer}>
              This is an automated notification from {APP_NAME}.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const content = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 0',
  borderRadius: '5px',
  border: '1px solid #e9ecef',
};

const header = {
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  padding: '0 40px',
  color: '#1a1a1a',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#484848',
  padding: '0 40px',
};

const detailsBox = {
  padding: '20px 40px',
  backgroundColor: '#f8f9fa',
  margin: '20px 40px',
  borderRadius: '5px',
  border: '1px solid #e9ecef',
};

const detail = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#484848',
  margin: '5px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  padding: '20px 0',
};

const button = {
  backgroundColor: '#000000',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '12px 30px',
  margin: '0 auto',
};

const footer = {
  fontSize: '14px',
  color: '#9ca299',
  textAlign: 'center' as const,
  padding: '0 40px',
  marginTop: '20px',
};
