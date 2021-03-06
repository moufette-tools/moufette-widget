import React from 'react'
import styled from 'styled-components'

const Container = styled.div`
   position: relative;

`

const Content = styled.div`
   border-radius: 10px 10px 0 30px;
   overflow: hidden;
   position: absolute;
   bottom: 10px;
   right: 0;
   width: 300px;
   border: 1px solid gray;
   border-color: #d9d9d9;
   background-color: white;
`

const Popover = ({ children, content, isOpen }: any) => {
   return (
      <div>
         <Container>
            {isOpen &&
               <Content>
                  {content}
               </Content>
            }
         </Container>
         {children}
      </div>
   )
}

export default Popover