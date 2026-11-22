import type {PortableTextComponents} from 'next-sanity'

export const bodyComponents: PortableTextComponents = {
  block: {
    normal: ({children}) => <p className="mb-3 text-body">{children}</p>,
  },
}

export const introComponents: PortableTextComponents = {
  block: {
    normal: ({children}) => <p className="text-[18px] text-body">{children}</p>,
  },
}

// Legal pages: each heading starts a numbered section like the design (Terms, Refunds, Privacy).
export const legalComponents: PortableTextComponents = {
  block: {
    h2: ({children}) => <h2 className="mb-2 border-t border-line pt-[22px] font-heading text-[21px] font-bold first:border-0">{children}</h2>,
    h3: ({children}) => <h3 className="mb-2 border-t border-line pt-[22px] font-heading text-[21px] font-bold first:border-0">{children}</h3>,
    normal: ({children}) => <p className="pb-[22px] text-body first:pt-[22px]">{children}</p>,
  },
}
