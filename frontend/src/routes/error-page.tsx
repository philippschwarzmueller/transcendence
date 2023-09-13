import { useRouteError } from 'react-router-dom';

export default function ErrorPage() {
  const error: any = useRouteError();

  return (
    <div>
      <h1>Ooops!</h1>
      <p>This route doesn't seem to exist</p>
      <p><i>{error.statusText || error.message}</i></p>
    </div>
  )
}
