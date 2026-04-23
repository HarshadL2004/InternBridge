import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Home from './components/Home';
import Root from './components/Root';
import Login from './components/Login';
import Signup from './components/Signup';
import StudentPage from './components/StudentPage';
import CompanyPage from './components/CompanyPage';
import CollegePage from './components/CollegePage';

import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import AuthProvider from './config/AuthProvider';
import AddJob from './components/AddJob';
import UserPrivate from './components/shared/UserPrivate';
import JobDetails from './components/JobDetails';
import Dashboard from './components/Dashboard';
const queryClient = new QueryClient()

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root></Root>,
    children:[
      {
        path:'/',
        element:<Home></Home>,
      },
      {
        path:'/login',
        element:<Login></Login>

      },
      {
        path:'/register',
        element:<Signup></Signup>

      },{
        path:'/add_job',
        element:<UserPrivate><AddJob></AddJob></UserPrivate>
      },{
        path:'/job/:id',
        element:<UserPrivate><JobDetails></JobDetails></UserPrivate>
      },{
        path:'/student',
        element:<StudentPage></StudentPage>
      },{
        path:'/company',
        element:<UserPrivate><CompanyPage></CompanyPage></UserPrivate>
      },{
        path:'/college',
        element:<UserPrivate><CollegePage></CollegePage></UserPrivate>
      },{
        path:'/dashboard',
        element:<UserPrivate><Dashboard></Dashboard></UserPrivate>
      },{
        path:'/ats',
        element:<UserPrivate><Dashboard></Dashboard></UserPrivate>
      }
    ]
  },
]);
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>


  </StrictMode>,
)
