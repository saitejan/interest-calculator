import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import './index.css';
import App from './App';
import Details from './components/details'
import * as serviceWorker from './serviceWorker';
import 'bootstrap/dist/css/bootstrap.min.css';

ReactDOM.render(
  <Router>
    <div>
      <Route exact path='/' component={App} />
      {/* </PrivateRoute> */}
      <Route path="/details" component={Details} />
    </div>
  </Router>,
  document.getElementById('root')
);

// function authenicated(wr) {
//   if (localStorage.token) {
//     if (localStorage.role === "admin") {
//       return true
//     }
//   }
//   return false
// }


// A wrapper for <Route> that redirects to the login
// screen if you're not yet authenticated.
// function PrivateRoute({ children, ...rest }) {
//   return (
//     <Route
//       {...rest}
//       render={({ location }) =>
//         authenicated() ? (
//           children
//         ) : (
//             <Redirect
//               to={{
//                 pathname: "/",
//                 state: { from: location }
//               }}
//             />
//           )
//       }
//     />
//   );
// }

serviceWorker.register();
