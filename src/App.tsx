import React, { useState, useEffect } from 'react'
import styled, { ThemeProvider } from 'styled-components/macro'
import { useMutation, useQuery } from '@apollo/client';
import html2canvas from 'html2canvas';
import { Tabs, useTabState, usePanelState } from "@bumaga/tabs";

import { CSSProp } from 'styled-components';

import Popover from './components/Popover'
import Tooltip from './components/Tooltip'
import Svg from './components/Svg'
import Features from './components/Features'

import { FEEDBACK_MUTATION } from './apollo/mutations';
import { WIDGET, FEATURES } from './apollo/queries';

import { _ } from './utils'

declare module 'react' {
   interface Attributes {
      css?: CSSProp;
      flex?: any;
   }
}


const Label = styled.label`
   margin: 10px 0;
`

const Floating = styled.div`
  position: fixed;
  right: 10px;
  margin: 10px;
  bottom: 10px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
`;

const Textarea = styled.textarea`
   display: block;
   flex: 1;
   border-radius: 2px;
   outline: none;
   border-color: #d9d9d9;
   font-size: 16px;
   padding: 10px;
   line-height: 24px;
`;

const FAB = styled.button`
   width: 48px;
   height: 48px;
   border-radius: 50%;
   background-color: ${props => props.theme.colors.primary};
   border-color: ${props => props.theme.colors.primary};
   outline: none;
   cursor: pointer;

   :active {
      background-color: ${props => props.theme.colors.primary};
   }
`;

const Button = styled.button`
   line-height: 1.5715;
   position: relative;
   display: inline-block;
   font-weight: 400;
   white-space: nowrap;
   text-align: center;
   background-image: none;
   border: 1px solid transparent;
   -webkit-box-shadow: 0 2px 0 rgba(0,0,0,.015);
   box-shadow: 0 2px 0 rgba(0,0,0,.015);
   cursor: pointer;
   -webkit-transition: all .3s cubic-bezier(.645,.045,.355,1);
   transition: all .3s cubic-bezier(.645,.045,.355,1);
   -webkit-user-select: none;
   -moz-user-select: none;
   -ms-user-select: none;
   user-select: none;
   -ms-touch-action: manipulation;
   touch-action: manipulation;
   height: 32px;
   padding: 4px 15px;
   font-size: 14px;
   border-radius: 2px;
   color: rgba(0,0,0,.65);
   background-color: #fff;
   border-color: #d9d9d9;

   color: #fff;
   background-color: ${props => props.theme.colors.primary};
   border-color: ${props => props.theme.colors.primary};
   text-shadow: 0 -1px 0 rgba(0,0,0,.12);
   -webkit-box-shadow: 0 2px 0 rgba(0,0,0,.045);
   box-shadow: 0 2px 0 rgba(0,0,0,.045);

   
   :disabled {
      color: rgba(0,0,0,.25);
      background-color: #f5f5f5;
      border-color: #d9d9d9;
      text-shadow: none;
      -webkit-box-shadow: none;
      box-shadow: none;
      cursor: not-allowed;
   }
`

const ContentContainer = styled.div`
   min-height: 300px;
   max-height: 100vh;
`

const Header = styled.div`
   flex-direction: column;
   display: flex;
   justify-content: center;
   align-items: center;
   background-color: ${props => props.theme.colors.primary};
   color: white;
   padding: 20px;
   padding-bottom: 0px;
`

const Body = styled.div`
   padding: 20px; padding-bottom: 0; display: flex; flex-direction: column
`

const Footer = styled.div`
   padding: 20px;
   flex-direction: row;
   display: flex;
   justify-content: flex-end
`

const Logo = styled.div`
   display: flex;
   justify-content: center;
   align-items: center;
   background-color: yellow;
   height: 40px;
   width: 40px;
   margin-bottom: 20px;
`

const TabsBar = styled.div`
   display: flex;
   align-self: stretch;
   margin-top: 20px;
`

const TabButtton = styled.div<any>`
   flex: 1;
   justify-content: center;
   align-itmes: center;
   text-align: center;
   padding: 10px;
   border-radius: 5px 5px 0 0;
   cursor: pointer;
   background-color: ${props => props.active ? 'white' : 'inherit'};
   color: ${props => props.active ? 'black' : 'white'};
   font-weight: bold;
`

const Viewer = styled.div<any>`
   display: flex;
   position: fixed;
   top: 0;
   left: 0;
   right: 0;
   bottom: 0;
   background-color: #00000099;
`

const Close = styled.div`
   position: absolute;
   right: 20px;
   top: 20px;
   font-size: 40px;
   cursor: pointer;
   color: white;
`




const Tab = ({ children }: any) => {
   const { isActive, onClick } = useTabState();
   return (
      <TabButtton active={isActive} onClick={onClick}>
         {children}
      </TabButtton>
   )
};

const Panel = ({ children }: any) => {
   const isActive = usePanelState();

   return isActive ? children : null;
};

const Feedback = () => {
   const tabState = useState(1)
   const [loading, setLoading] = useState(false)
   const [submitted, setSubmitted] = useState(false)
   const [viewer, setViewer] = useState(false)
   const [isOpen, setIsOpen] = useState(false)
   const [message, setMessage] = useState('')
   const [image, setImage] = useState(null)
   const [screenshot, setScreenshot] = useState(false)
   const [widgetConfig, setWidgetConfig] = useState({ theme: { colors: { primary: '#1890ff' } } } as any)


   const [feedback] = useMutation(FEEDBACK_MUTATION);
   const { data } = useQuery(WIDGET)


   useEffect(() => {
      if (!(_ as any).cookie.get('mf_uuid')) {
         (_ as any).cookie.set('mf_uuid', (_ as any).UUID(), 365, true, true)
      }
   }, [])

   useEffect(() => {
      if (data) {
         setWidgetConfig(data.widget)
      }
   }, [data])

   const sendFeedback = () => {
      setLoading(true)
      feedback({
         variables: {
            message,
            image
         },
      }).then(({ data }) => {
         // message.success('Thank you for your feedback. You Rock!', 5);
         setLoading(false)
         setSubmitted(true)
         setImage(null)
         setMessage('')
      }).catch(e => {
         setLoading(false)
         console.log(e)
      })
   }

   const captureScreen = () => {
      html2canvas(document.querySelector("html") as any).then((canvas: any) => {
         const image = canvas.toDataURL("image/png");
         setImage(image)
      });
   }

   const toggleViewer = () => {
      setViewer(!viewer)
   }


   let content = null

   // if (loading) {
   //    content = (<div style={{ height: 300 }}>loading</div>)
   // } else {
   //    if (submitted) {
   //       content = <div style={{ height: 300 }}>Thank you!</div>
   //    } else {
   //       content = (

   //       )
   //    }
   // }


   content = (
      <div>
         <Tabs state={tabState}>
            <Header>
               <p css={`margin: 0; font-weight: bold`}>Help us imporove {widgetConfig.appName}</p>
               {/* <p css={`margin: 0`}>Need help? Contact us.</p> */}

               <TabsBar>
                  <Tab>Feedback</Tab>
                  <Tab>
                     Features
                  </Tab>
               </TabsBar>
            </Header>

            <Panel>
               <Body>
                  {
                     image &&
                     <div onClick={toggleViewer} style={{ border: '1px dashed', textAlign: 'center', backgroundColor: '#00000010' }} >
                        <img style={{ maxHeight: 150, maxWidth: '100%', width: 'auto' }} src={image || ''} />
                     </div>
                  }
                  <Label>
                     <input
                        style={{ marginRight: 5 }}
                        name="screenshot"
                        type="checkbox"
                        checked={screenshot}
                        onChange={() => {
                           setScreenshot(!screenshot)
                           if (!screenshot) {
                              captureScreen()
                           } else {
                              setImage(null)
                           }
                        }}
                     />
                        Include screenshot
                     </Label>
                  <Textarea
                     autoFocus
                     placeholder="Share your ideas, tell us what you like and what you don't. We want to hear it, the good and the bad."
                     // autofocusHtml="true"
                     value={message}
                     onChange={e => setMessage(e.target.value)}
                     rows={5}
                  />

               </Body>
               <Footer>
                  <Button disabled={!message} onClick={sendFeedback}>
                     Next
                  </Button>
               </Footer>
            </Panel>

            <Panel>
               <Body>
                  <Features />
               </Body>
            </Panel>

         </Tabs>
         {
            viewer &&
            <Viewer>
               <Close onClick={toggleViewer}>X</Close>
               <img style={{ maxHeight: '80%', maxWidth: '80%', width: 'auto', alignSelf: 'center', margin: 'auto' }} src={image || ''} />
            </Viewer>
         }
      </div>
   )

   return (
      <ThemeProvider theme={widgetConfig.theme}>
         <Floating>
            <Popover
               isOpen={isOpen}
               content={<ContentContainer>
                  {content}
               </ContentContainer>
               }
            >
               <Tooltip messages={['Psst', 'Hey, psst', 'We need your help!']} delay={1000} interval={3000}>
                  <FAB onClick={() => {
                     setIsOpen(!isOpen)
                     if (screenshot)
                        captureScreen()
                  }}>
                     <Svg />
                  </FAB>
               </Tooltip>
            </Popover >
         </Floating >
      </ThemeProvider>
   )
}

export default Feedback