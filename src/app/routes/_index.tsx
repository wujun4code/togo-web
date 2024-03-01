import * as React from 'react';
import type { MetaFunction } from '@remix-run/node';
import { Link } from '@remix-run/react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

// https://remix.run/docs/en/main/route/meta
export const meta: MetaFunction = () => [
  { title: 'Remix Starter' },
  { name: 'description', content: 'Welcome to remix!' },
];

// https://remix.run/docs/en/main/file-conventions/routes#basic-routes
export default function Index() {
  return (
    <React.Fragment>
      <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
        Material UI Remix in TypeScript example
      </Typography>
      <Button variant="contained" component={Link} to="/about">
        Go to the about page
      </Button>
    </React.Fragment>
  );
}
