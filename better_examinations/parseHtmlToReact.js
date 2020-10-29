import React from 'react';
import ReactHtmlParser from 'react-html-parser';

export const HtmlToReact = (html, components) => {
  if (!html) {
    return null;
  }

  const transform = (node, idx) => {
    if (node.type !== 'tag') {
      return;
    }

    // const componentName = node.name.charAt(0).toUpperCase() + node.name.slice(1);
    const componentName = node.name.toLowerCase();

    const Component = components[componentName];

    const props = {
      ...node.attribs,
      style: getStyleObject(componentName),
    };

    if (props.class) {
      props.className = props.class;
      delete props.class;
    }

    if (Component && node && node.children && node.children.length) {
      return (
        <Component {...props} key={idx}>
          {node.children.map((child, i) => {
            if (child.type === 'text') {
              return child.data;
            }

            return transform(child, i);
          })}
        </Component>
      );
    } else if (Component) {
      return <Component {...props} key={idx} />;
    }

    return null;
  };

  const Component = ReactHtmlParser(html, {
    transform,
  });
  return Component;
};

export const getStyleObject = componentName => {
  const styles = {
    bold: {
      fontWeight: 'bold',
      fontStyle: 'bold',
      color: 'black',
    },
    italic: {
      fontStyle: 'italic',
    },
    underline: {
      textDecoration: 'underline',
    },
  };

  switch (componentName) {
    case 'b':
      return styles.bold;
    case 'u':
      return styles.underline;
    case 'i':
      return styles.italic;
    default:
      return {};
  }
};
