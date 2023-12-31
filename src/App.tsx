import React from 'react'
import { object, string, boolean, Output, optional, minLength, url, regex, startsWith } from 'valibot'
import './App.css'
import { API } from './utils/api'
import imageSrc from './assets/info.png'
import infoIcon from './assets/info-icon.svg'

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const App: React.FC = () => {

  const queryParameters = new URLSearchParams(window.location.search)
  const discordId = queryParameters.get("discordId")

  const MySwal = withReactContent(Swal)
  const [loading, setLoading] = React.useState(false)

  const formSchema = object({
    fullName: string("Name must be a string", [minLength(1, 'Please enter your full name')]),
    discordId: string("Discord username must be a string", [minLength(1, "Please enter your discord ID")]),
    mobileNumber: string("Your mobile must be a number", [regex(/^\d{10}$/, "Please enter a valid mobile number")]),
    github: optional(string("Github must be a string", [url("enter a valid url"), startsWith('https://github.com', 'Please enter a valid github url')])),
    linkedin: optional(string("LinkedIn must be a string", [url("enter a valid url"), startsWith('https://www.linkedin.com', 'Please enter a valid linkedin url')])),
    roles: object({
      frontEnd: boolean(),
      backEnd: boolean()
    })
  })

  type FormState = Output<typeof formSchema>

  const [formState, setFormState] = React.useState<FormState>({
    fullName: '',
    discordId: discordId ?? '',
    mobileNumber: '',
    github: '',
    linkedin: '',
    roles: {
      backEnd: false,
      frontEnd: false
    }
  })

  type FormErrors = {
    [key in (keyof FormState)]?: string
  }

  const [formErrors, setFormErrors] = React.useState<FormErrors>({})

  const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    let form: FormState = { ...formState }
    Object.keys(formState).forEach(key => {
      if (!['fullName', 'discordId', 'mobileNumber'].includes(key) && formState[key as keyof FormState] === '') {
        form = { ...form, [key]: undefined }
      }
    })
    const result = formSchema._parse(form)
    if (result.issues && result.issues.length > 0) {
      let issues: FormErrors = {}
      for (const issue of result.issues) {
        if (issue.path) {
          issues = { ...issues, [issue.path?.[0].key]: issue.message }
          // setFormErrors((prev: FormErrors) => ({ ...prev, [issue.path?.[0].key]: issue.message }))
        }
      }
      setFormErrors(issues)
      setLoading(false)
    } else {
      setFormErrors({})
      API.register({
        fullname: formState.fullName,
        discordId: formState.discordId,
        phone: Number(formState.mobileNumber),
        github: formState.github,
        linkedin: formState.linkedin,
        tech: Object.keys(formState.roles).filter(key => formState.roles[key as keyof FormState['roles']])
      }).then(async (res) => {
        setLoading(false)
        if (res?.status === 200) {
          MySwal.fire({
            title: <p>{res?.message ?? 'Successfully registered!!'}</p>,
            icon: 'success'
          }).then(() => {
            window.location.assign('https://discord.com/invite/g9ZEnxsWDz')
          })
        } else {
          const response = await res.json()
          MySwal.fire({
            title: <p>{response?.message ?? 'Something went wrong. Please try again later!'}</p>,
            icon: 'error'
          })
        }
      }).catch((err) => {
        console.log(err)
        MySwal.fire({
          title: <p>{err || 'Something went wrong. Please try again later!'}</p>,
          icon: 'error'
        })
        setLoading(false)
      })
    }
  }

  React.useEffect(() => {
    Object.keys(formState).forEach(key => {
      const element = document.getElementById(key)
      if (element && formErrors[key as keyof FormState]) {
        element.classList.add('input-error')
      } else if (element) {
        element.classList.remove('input-error')
      }
    })
  }, [formErrors, formState])



  return (
    <>
      <ul className="background">
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
      </ul>
      <div style={{ width: 'auto' }}>
        <h1 style={{ position: 'relative' }}>DJX Community Registration 🚀</h1>
        <div className='card'>
          <form id='discordForm' onSubmit={submitHandler} autoComplete='off'>
            <div className='form-item'>
              <label htmlFor="fullName">Full Name<span className='required'>*</span></label>
              <input className='text-field' type="text" name="fullName" id="fullName"
                value={formState.fullName} onChange={e => setFormState({ ...formState, fullName: e.target.value })}
              />
              {formErrors.fullName && <span className='error'>{formErrors.fullName}</span>}
            </div>
            <div className='form-item'>
              <label htmlFor="discordId">Discord ID<span className='required'>*</span>
                <div className="tooltip">
                  <img src={infoIcon} alt="info-icon" />
                  <span className="tooltip-image"><img src={imageSrc} alt="Info" /></span>
                </div>
              </label>
              <input className='text-field' type="text" name="discordId" id="discordId"
                value={formState.discordId} onChange={e => setFormState({ ...formState, discordId: e.target.value })}
              />
              {formErrors.discordId && <span className='error'>{formErrors.discordId}</span>}
            </div>
            <div className='form-item'>
              <label htmlFor="mobileNumber">Mobile Number<span className='required'>*</span></label>
              <input className='text-field' type="text" name="mobileNumber" id="mobileNumber"
                value={formState.mobileNumber} onChange={e => setFormState({ ...formState, mobileNumber: e.target.value })}
              />
              {formErrors.mobileNumber && <span className='error'>{formErrors.mobileNumber}</span>}
            </div>
            {/* <div className='form-item'>
              <label htmlFor="email">Email</label>
              <input className='text-field' type="email" name="email" id="email"
                value={formState.email} onChange={e => setFormState({ ...formState, email: e.target.value })}
              />
              {formErrors.email && <span className='error'>{formErrors.email}</span>}
            </div> */}
            <div className='form-item'>
              <label htmlFor="github">Github</label>
              <input className='text-field' type="url" name="github" id="github"
                value={formState.github} onChange={e => setFormState({ ...formState, github: e.target.value })}
              />
              {formErrors.github && <span className='error'>{formErrors.github}</span>}
            </div>
            <div className='form-item'>
              <label htmlFor="linkedin">LinkedIn</label>
              <input className='text-field' type="url" name="linkedin" id="linkedin"
                value={formState.linkedin} onChange={e => setFormState({ ...formState, linkedin: e.target.value })}
              />
              {formErrors.linkedin && <span className='error'>{formErrors.linkedin}</span>}
            </div>
            <div className='form-item'>
              <label htmlFor="roles">Discord Server Roles</label>
              <div id='roles'>
                <span>
                  <input type="checkbox" name="frontEnd" id="frontEnd"
                    checked={formState.roles?.frontEnd} onChange={e => setFormState({ ...formState, roles: { ...formState.roles, frontEnd: e.target.checked } })}
                  /> <label htmlFor="frontEnd">Front End</label>
                </span>
                <span>
                  <input type="checkbox" name="backEnd" id="backEnd"
                    checked={formState.roles?.backEnd} onChange={e => setFormState({ ...formState, roles: { ...formState.roles, backEnd: e.target.checked } })}
                  /> <label htmlFor="backEnd">Back End</label>
                </span>
              </div>
            </div>
            {/* <div>
            <input type="checkbox" name="tandc" id="tandc" /> I agree to the <a href="#">Terms and Conditions</a>
          </div> */}
            <div className='form-item'>
              <input id='submitButton' type="submit" value="Submit" disabled={loading} />
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default App
