import React, { Dispatch, SetStateAction } from "react";
import './modal.css'
import { ReactNode } from 'react'

export default function Modal({active, setActive, children}: {active: boolean, setActive: Dispatch<SetStateAction<boolean>>, children: ReactNode}) {
    return(
        <div 
            className={active ? "modal active" : "modal"}
            onClick={() => setActive(false)}
            >
            <div 
                className="modal__content"
                onClick={e => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
};