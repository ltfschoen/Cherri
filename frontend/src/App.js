// import our constants
import React, { Component } from 'react'
import decodeJWT from 'jwt-decode'
import './App.css'
// invoiceAPI should be below
import * as profileAPI from './api/profiles'
import ProfileForm from './components/ProfileForm'
import ProfileEditForm from './components/ProfileEditForm'
import UploadHkid from './components/UploadHkid'
import UploadIc from './components/UploadIc'
// imports associated with invoice
import * as invoiceAPI from './api/invoices'
import InvoiceEditForm from './components/InvoiceEditForm'
import InvoiceForm from './components/InvoiceForm'
import InvoiceDelete from './components/InvoiceDelete'
import InvoiceUpload from './components/InvoiceUpload'
import InvoiceSpaUpload from './components/InvoiceSpaUpload'
import InvoiceDetails from './components/InvoiceDetails'
// imports associated with page selection'
import AccountPage from './pages/AccountPage'
import HomePage from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import LearnPage from './pages/LearnPage'
// imports associated with signing up & signing in
import RegisterForm from './components/RegisterForm'
import SignInForm from './components/SignInForm'
import SignOutForm from './components/SignOutForm'
import * as auth from './api/signin'
import * as userAPI from './api/user'
import Navigation from './components/navbar'

import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom'

// Our Stripe imports
import { STRIPE_URL   } from './constants/stripe'
import ChargesPage from './pages/ChargesPage'
// stats const is taken from signin as auth.sendStats

// allow for env files
require('dotenv').config()

// our main page app
class App extends Component {
  state = {
    profiles: null,
    users: null,
    invoices: null,
    email: null
  }

  componentDidMount(){
    // App remounts on submit for HKids,
    // current email is dropped so we have to reset it.
    const token = localStorage.getItem('token')
    if (!!token) {
      try {
        const decodedToken = decodeJWT(token)
        const email = decodedToken.email
        console.log({ decodedToken })
        this.setState({ email: email })
      } catch(err) {
        console.log("Invalid token", token)
      }
    }

    // calling the fetch functions from profileAPI file
    profileAPI.all()
    .then(profiles => {
      // console.log(profiles)
      this.setState({ profiles })
      // test log to ensure that  profile information is coming through from backend
    })

    // setting a state when invoiceAPI is called
    invoiceAPI.all()
    .then(invoices => {
      this.setState({ invoices })
      // {/*test log to ensure that  profile information is coming through from backend*/}
    })

    // setting a state when userAPI is called
    userAPI.all()
    .then(users => {
      this.setState({ users })
      // {/*test log to ensure that  profile information is coming through from backend*/}
    })
  }

  handleProfileSubmission = (profile) => {
    this.setState(({profiles}) => {
      return { profiles: [profile].concat(profiles)}
    });
    profileAPI.save(profile);
  }

  handleRegister = (event) => {
    event.preventDefault()
    // declaration of const
    const form = event.target
    const element = form.elements
    const email = element.email.value
    const account = '5a63a30b4db988e620265bff'
    const password = element.password.value
    const admin = false
    auth.register({email, password, account, admin})
    .then(() => {
      console.log('in App.js with response from server. setting state for email: ', email);
      this.setState({ email: email })
      userAPI.all()
        .then( users =>
          this.setState({ users })
      )}
    )
  }

  // Event handler for signin of existing User
  handleSignIn = (event) => {
    event.preventDefault()
    // declaration of const
    const form = event.target
    const element = form.elements
    const email = element.email.value
    const password = element.password.value
    auth.signIn({email, password})
    .then((json) => {
      console.log('App.js signed in and setting state with email: ', email);
      this.setState({ email: email })
      userAPI.all()
        .then( users =>
          this.setState({ users })
      )}
    )
  }

  handleProfileEditSubmission = (profile) => {
    this.setState(({profiles}) => {
      return { profiles: [profile].concat(profiles)}
    });
    // calling the save function from backend API route
    profileAPI.edit(profile);
  }

  handleSignOut = () => {
    auth.signOut()
    this.setState({profiles:null})
  }

  // event handler for Invoice create
  handleInvoiceSubmission = (invoice) => {
    this.setState(({invoices}) => {
      return { invoices: [invoice].concat(invoices)}
    });
    // calling the save function from backend API route
    invoiceAPI.save(invoice);
  }

  handleInvoiceEditSubmission = (invoice) => {
    this.setState(({invoices}) => {
      return { invoice: [invoice].concat(invoices)}
    });
    // calling the save function from backend API route
    invoiceAPI.edit(invoice);
  }

  render () {
    const {users, invoices, profiles, email} = this.state

    return (
      <Router>
      <div className='App'>
        <Navigation email={email}/>
        {/*  Switch statment to handle all our routes */}
        <Switch>
          <Route exact path='/' render={
              () => (
                <HomePage />
              )}/>
          <Route path='/learnmore' render={
              () => (
                <LearnPage/>
              )}/>
          <Route path='/dashboard' render={
              () => {
                if (users && profiles && invoices) {
                  return (
                    <DashboardPage users={users} invoices={invoices} email={email} profiles={profiles}/>
                  )

                } else {
                  return null
                }
              }}/>
          <Route path='/admindashboard' render={
              () => {
                if (users && profiles && invoices) {
                  return <AdminDashboardPage users={users} invoices={invoices} profiles={profiles}/>
                } else {
                  return null
                }
              }}/>
          <Route path='/profile/create' render={
              () => (
                <ProfileForm
                  email={this.state.email}
                  onSubmit={this.handleProfileSubmission}
                />
              )}/>
          <Route path='/profile/edit' render={
              () => (
                <div>
                  <ProfileEditForm onSubmit={this.handleProfileEditSubmission}/>
                </div>
              )}/>
          <Route path='/signup' render={
            () => (
              <div>
              { auth.isSignedIn() && <Redirect to='/profile/create'/>
              }
              <RegisterForm onSignUp={this.handleRegister} profiles={profiles}/>
              </div>
              )}/>
          <Route path='/uploadHkid' render={
              () => {
                if (auth.isSignedIn() && users) {
                  return <UploadHkid users={users}/>
                } else {
                  return null
                }
              }}/>
          <Route path='/uploadIc' render={
              () => {
                if (auth.isSignedIn() && users) {
                  return <UploadIc users={users}/>
                } else {
                  return null
                }
              }}/>
          <Route path='/signin' render={
            () => (
              <div>
                { auth.isSignedIn() && email==='jeff@cherri-finance.com' && <Redirect to='/admindashboard'/> }
                { auth.isSignedIn() && <Redirect to='/dashboard'/> }
                <SignInForm onSignIn={this.handleSignIn} profiles={profiles}/>
              </div>
              )}/>
          <Route path='/invoice/create' render={
              () => (
                <div>
                  <InvoiceForm onSubmit={this.handleInvoiceSubmission}/>
                </div>
              )}/>
          {/* <Route path='/invoice/edit' render={
              () => (
                <div>
                  {/* <InvoiceEditForm onSubmit={this.handleInvoiceEditSubmission}/>
                </div> */}
              )}/> */}
               {/* our charges route for testing making a charge between two of our stripe customers */}
         <Route path='/invoice/upload' render={
            () => {
                if (auth.isSignedIn() && users && profiles) {
                  return <InvoiceUpload profile={profiles} users={users}/>
                } else {
                  return null
                }
            }}/>
        <Route path='/invoice/spaupload' render={
          () => {
              if (auth.isSignedIn() && users && profiles) {
                return <InvoiceSpaUpload profile={profiles} users={users}/>
              } else {
                return null
              }
          }}/>
          <Route path='/invoice/:id/edit' render={
            ({ match }) => {
             if ( invoices ) {
             const id = match.params.id
             const invoice = invoices.find((i) => i._id === id)
             return (
               <div>
                 <InvoiceEditForm onSubmit={this.handleInvoiceEditSubmission} invoice={invoice} />
                 <br />
               </div>
             )
            } else {
             return <h1></h1>
            }
            }} />
          <Route path='/invoice/:id/delete' render={
            () => {
                (invoice) => {
                  this.setState(({invoices}) => {
                    return { invoice: [invoice].concat(invoices)}
                  });
                  invoiceAPI.supprimer(invoice);
            }}} />
          <Route path='/invoice/:id' render={
          ({ match }) => {
            if ( invoices ) {
              const id = match.params.id
              const invoice = invoices.find((i) => i._id === id)
              return (
               <div>
                 <InvoiceDetails email={email} users={users} invoice={invoice} />
                 <br />
               </div>
              )
            } else {
              return <h1></h1>
            }
          }} />

          <Route path='/charges' render={
               () => (
               <div>
                 <ChargesPage token={ auth.token() } />
               </div>
               )}/>
          <Route path='/signout' render={() => (
                <SignOutForm onSignOut={this.handleSignOut}/>
              )}/>
          <Route path='/profile/edit' render={
              () => (
                <ProfileEditForm onSubmit={this.handleProfileEditSubmission}/>
              )} />
        </Switch>
      </div>
      </Router>
    )
  }
}

export default App
