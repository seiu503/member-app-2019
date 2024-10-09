import {
  useLocation,
  useNavigate,
  useParams,
  redirect
} from "react-router-dom";

export default function withRouter(Component) {
  function ComponentWithRouterProp(props) {
    let location = useLocation();
    let navigate = useNavigate();
    let params = useParams();
    return (
      <Component
        {...props}
        location={location}
        params={params}
        navigate={navigate}
        redirect={redirect}
      />
    );
  }

  return ComponentWithRouterProp;
}
