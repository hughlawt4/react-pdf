/* eslint react/prop-types: 0 */
/* eslint react/jsx-sort-props: 0 */

import ReactPDF, {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';
import chalk from 'chalk';
import fs from 'fs';
import moment from 'moment';
import React from 'react';
import { HtmlToReact } from './parseHtmlToReact';
import data from './submissions/sessions.json';

/**
 * If you have issue with certain words breaking hyphenation
 * uncomment the following lines to disable hypenation altogether
 */
// const hyphenationCallback = word => [word];
// Font.registerHyphenationCallback(hyphenationCallback);

const { sessions, questions, courseName, examname } = data;

const numberPadding = 3;

const styles = StyleSheet.create({
  titlePage: {
    boxSizing: 'border-box',
    flexDirection: 'column',
    padding: 20,
    paddingTop: 200,
    fontFamily: 'Lato',
  },
  titlePageText: {
    paddingLeft: 50,
  },
  page: {
    paddingBottom: 30,
    color: '#333',
    fontFamily: 'Lato',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#999',
    marginLeft: 50,
    marginRight: 50,
    marginTop: 20,
    padding: 10,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#999',
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    position: 'absolute',
    bottom: 0,
    paddingLeft: 10,
    paddingRight: 10,
    marginBottom: 10,
    marginTop: 20,
  },
  section: {
    marginLeft: 50,
    marginRight: 50,
    padding: 10,
    paddingBottom: 50,
    fontSize: 13,
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
  subTitle: {
    color: '#666',
    marginBottom: 15,
  },
  details: {
    color: '#666',
    fontSize: 14,
    marginBottom: 15,
  },
  answerText: {
    color: '#787878',
    fontSize: 12,
    marginBottom: 6,
    paddingTop: 20,
    display: 'block',
    borderTopColor: '#afafaf',
    borderTopStyle: 'dotted',
    borderTopWidth: 1,
  },
  question: {
    marginBottom: 10,
    lineHeight: 1.4,
    fontSize: 11,
    color: '#565656',
  },
  answer: {
    color: '#454545',
    fontSize: 12,
    lineHeight: 2,
  },
  note: {
    fontStyle: 'italic',
    color: '#aa0000',
  },
  bold: {
    fontWeight: 'bold',
  },
  beImage: {
    height: 40,
    marginLeft: -15,
  },
  beImageLarge: {
    alignSelf: 'start',
    width: 150,
    marginLeft: 10,
    marginBottom: 30,
  },
  li: {
    paddingLeft: 25,
  },
  table: {
    display: 'table',
  },
  tbody: { display: 'table-row-group' },
  tr: {
    display: 'table-row',
  },
  td: {
    display: 'table-cell',
  },
});

Font.register({
  family: 'Lato',
  fonts: [
    {
      src: `${__dirname}/fonts/Lato/Lato-Regular.ttf`,
    },
    {
      fontStyle: 'italic',
      src: `${__dirname}/fonts/Lato/Lato-Italic.ttf`,
    },
    {
      fontStyle: 'bold',
      src: `${__dirname}/fonts/Lato/Lato-Bold.ttf`,
    },
  ],
});

const getQuestionText = id => {
  const question = questions.find(q => q[id] !== undefined);
  return question[id];
};

const problematicSessions = [];
const sessionsWithUnwrapped = [];
const noOfSessions = sessions.length;

const processMarkup = (markup, sessionId) => {
  try {
    const processed = HtmlToReact(markup, {
      p: Text,
      b: Text,
      strong: Text,
      u: Text,
      i: Text,
      em: Text,
      a: Text,
      br: View,
      span: Text,
      ul: View,
      ol: View,
      li: Text,
      style: null,
      font: Text,
      div: Text,
      table: View,
      sup: Text,
    });
    // console.log(processed);
    if (processed.hasUnwrapped) {
      sessionsWithUnwrapped.push(sessionId);
    }
    return processed.component;
  } catch (error) {
    console.log(error);
  }
};

const chunkArray = (arr, chunkSize) => {
  const tempArray = [];
  if (!arr.length) {
    console.log(arr);
  }
  for (let index = 0; index < arr.length; index += chunkSize) {
    const currentChunk = arr.slice(index, index + chunkSize);
    tempArray.push(currentChunk);
  }

  return tempArray;
};

const processAnswer = (response, sessionId) => {
  return response.length ? (
    processMarkup(response, sessionId)
  ) : (
    <Text style={styles.note}>No response recorded</Text>
  );
};

const generateAnswerPage = (
  { attempted, response, item_reference },
  session,
) => {
  const processedAnswer = attempted ? (
    processAnswer(response, session.index)
  ) : (
    <Text style={styles.note}>Not attempted</Text>
  );

  return (
    <Page size="A4" style={styles.page} key={`page-${item_reference}`} wrap>
      <View style={styles.header} fixed>
        <Text>{examname}</Text>
        <Text>Candidate: {session.index}</Text>
      </View>
      <View key={`chunk-${item_reference}`} style={styles.section}>
        <View style={styles.question}>
          {processMarkup(getQuestionText(item_reference))}
        </View>
        <View style={styles.answer}>
          <Text style={styles.answerText}>STUDENT ANSWER</Text>
          {processedAnswer}
        </View>
      </View>
      <View style={styles.footer} fixed>
        <Text render={props => `${props.pageNumber} / ${props.totalPages}`} />
      </View>
    </Page>
  );
};

const padFileNumber = (num, size) => {
  let numAsString = num.toString();
  while (numAsString.length < size) numAsString = '0' + numAsString;
  return numAsString;
};

const processSession = async (session, force) => {
  const doc = session => (
    <Document>
      <Page size="A4" style={styles.titlePage} wrap>
        <Image
          src={`${__dirname}/image.png`}
          allowDangerousPaths
          style={styles.beImageLarge}
        />
        <View style={styles.titlePageText}>
          <Text style={styles.title}>{courseName}</Text>
          <Text style={styles.subTitle}>{examname}</Text>
          <Text style={styles.subTitle}>Candidate: {session.index}</Text>
          <View style={styles.details}>
            <Text>Started:</Text>
            <Text>
              {moment(session.dt_started).format('Do MMMM yyyy - h:mm a')}
            </Text>
          </View>
          <View style={styles.details}>
            <Text>Completed:</Text>
            <Text>
              {session.dt_completed
                ? moment(session.dt_completed).format('Do MMMM yyyy - h:mm a')
                : `No formal submission`}
            </Text>
          </View>
        </View>
      </Page>
      {session.responses.map((response, i) => (
        <React.Fragment key={response.item_reference}>
          {generateAnswerPage(response, session)}
        </React.Fragment>
      ))}
    </Document>
  );
  console.log(chalk.blue(`Generating PDF for User ID ${session.index}`));
  const alreadyExists = fs.existsSync(
    `${__dirname}/exported_pdfs/${padFileNumber(
      session.index,
      numberPadding,
    )}.pdf`,
  );
  if (alreadyExists && !force) {
    return console.log(chalk.green('File already exported... moving on.'));
  }
  try {
    const tmpSession = doc(session);
    await ReactPDF.render(
      tmpSession,
      `${__dirname}/exported_pdfs/${padFileNumber(
        session.index,
        numberPadding,
      )}.pdf`,
    );
    console.log(chalk.green('Done.'));
  } catch (error) {
    console.log(error);
    problematicSessions.push(session.index);
  }
};

(async function() {
  console.log(chalk.blue('Checking of the export directory exists...'));
  const folderExists = fs.existsSync(`${__dirname}/exported_pdfs`);
  console.log(
    chalk.blue(
      `${
        folderExists
          ? 'Directory already exists...'
          : 'Directory does not exist.. Creating...'
      }`,
    ),
  );
  if (!folderExists) {
    fs.mkdir(`${__dirname}/exported_pdfs`, err => {
      if (err) console.log(chalk.red('Directory not created...'));
    });
  }

  const start =
    (parseInt(process.argv[2], 10) && parseInt(process.argv[2], 10) - 1) || 0;
  const end =
    (parseInt(process.argv[3], 10) && parseInt(process.argv[3], 10)) ||
    start + 1;

  const force = process.argv[4] === '--force';

  console.log(
    chalk.yellow(
      `Processing ${end -
        start} out of ${noOfSessions} sessions... Let's do this!`,
    ),
  );

  for (let i = start || 0; i < end; i++) {
    const session = sessions[i];
    await processSession(session, force);
  }

  console.log(
    chalk.blue(
      `Processed ${end - start - problematicSessions.length} out of ${end -
        start} successfully.`,
    ),
  );

  if (problematicSessions.length) {
    console.log(chalk.red('Had issues with the following sessions:'));
    console.log(problematicSessions);
  }

  if (sessionsWithUnwrapped.length) {
    console.log(chalk.red('Identified unwrapped text nodes in:'));
    console.log(sessionsWithUnwrapped);
  }
})();
