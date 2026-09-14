import React, { useEffect } from 'react';

export const Helmet = ({ children, title }) => {
  useEffect(() => {
    if (title) {
      document.title = title;
    }
    if (children) {
      React.Children.forEach(children, (child) => {
        if (!child) return;
        if (child.type === 'title' && child.props && child.props.children) {
          const titleText = Array.isArray(child.props.children)
            ? child.props.children.join('')
            : String(child.props.children);
          document.title = titleText;
        } else if (child.type === 'meta' && child.props) {
          const { name, content } = child.props;
          if (name && content) {
            let meta = document.querySelector(`meta[name="${name}"]`);
            if (!meta) {
              meta = document.createElement('meta');
              meta.name = name;
              document.head.appendChild(meta);
            }
            meta.content = content;
          }
        }
      });
    }
  }, [children, title]);

  return null;
};

export default Helmet;
