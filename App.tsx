//参考URL
//https://www.jacepark.com/how-to-check-pronunciation-with-speech-recognition/
//https://digipress.info/tech/sample-code-with-chatgpt-api-in-react/

import React, { useState, useEffect } from 'react';
import { Alert, Button, SafeAreaView, StyleSheet, Text, View, TextInput } from 'react-native';
import Voice, { SpeechResultsEvent, } from '@react-native-voice/voice';
import axios from 'axios';

function App(): React.JSX.Element {

  //音声を録音しテキスト化する際に必要なパラメータ
  const [lastVoiceText, setLastVoiceText] = useState("音声入力結果");
  const [recordButtonLabel, setRecordButtonLabel] = useState("音声認識開始");
  const [isRecord, setIsRecord] = useState<boolean>(false);
  const [topTextLabel,setTopTextLabel] = useState("今日の調子はどうですか？");

  //テキスト化した音声をchatGPTのAPIで分析する必要なパラメータ
  const API_URL = 'https://api.openai.com/v1/';
  const API_KEY = 'ここにAPIKEYを入力';

  const goodButtonAction = () => {
    Alert.alert(
      '健康で何よりです！', '',
      [{ text: 'OK', onPress: () => console.log('OKが押された') },]);
  };

  const badButtonAction = () => {
    Alert.alert(
      '病院に行きましょう！', '',
      [{ text: 'OK', onPress: () => console.log('OKが押された') },]);
  };

  const _onSpeechResults = (event: SpeechResultsEvent) => {
    if (event && event.value) {
      setLastVoiceText(event.value[0])
    } else {
      console.log('voice recognition error');
    }
  };

  const _onRecordVoice = () => {
    if (isRecord == true) {
      Voice.stop();
      _checkVoiceTextConent()
      setRecordButtonLabel("音声認識開始")
    } else {
      Voice.start('ja-JP');
      setRecordButtonLabel("音声認識完了")
    }
    setIsRecord(!isRecord);
  };

  //chatGPT_APIに質問し、返答内容に応じた処理を行う
  const _checkVoiceTextConent = async () => {
    try {

      //処理に時間が掛かるのでトップのラベルの表示を変える
      setTopTextLabel('音声データ解析・・・')

      const response = await axios.post(`${API_URL}chat/completions`, {
        // モデルの指定
        model: 'gpt-3.5-turbo',
        // 質問内容の指定
        messages: [
          {
            'role': 'user',
            'content': `「${lastVoiceText}」という文章が「元気です」という文章と意味が似ている場合は1を出力、「具合が悪いです」という文章と似ている場合は2を出力、その他の場合は3を出力してください`,
          }
        ],
      }, {
        // 送信する HTTP ヘッダー(認証情報)
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      });

      // 回答の取得し、条件分岐で回答に応じた処理を行う
      switch (response.data.choices[0].message.content.trim()) {
        case '1':
          goodButtonAction()
          break
        case '2':
          badButtonAction()
          break
        default:
          Alert.alert(
            'エラー', 'もう一度試してください。',
            [{ text: 'OK', onPress: () => console.log('OKが押された') },]);
          break
      }
      setTopTextLabel('今日の調子はどうですか？')

    } catch (error) {
      console.error(error)
    }
  }

  //useEffectとは関数コンポーネントで副作用を制御できるフックであり、関数を実行するタイミングをReactのレンダリング後まで遅らせられる
  useEffect(() => {
    Voice.onSpeechResults = _onSpeechResults;
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  //以下UI部分
  return (
    <SafeAreaView style={styles.safeAreaView}>
      <Text style={styles.label}>{topTextLabel}</Text>

      <View style={styles.answerButtonView}>
        <Button
          title="健康です"
          onPress={goodButtonAction}
        />
      </View>

      <View style={styles.answerButtonView}>
        <Button
          title="具合が悪い"
          onPress={badButtonAction}
        />
      </View>

      <TextInput
        multiline={true}
        editable={false}
        value={lastVoiceText}
        style={styles.textArea}
      />

      <View style={styles.inputVoiceButtonView}>
        <Button
          title={recordButtonLabel}
          onPress={_onRecordVoice}
        />
      </View>
    </SafeAreaView>
  );
}

//以下UIの装飾部分
const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    margin: 30,
    fontSize: 25,
    fontWeight: 'bold',
  },
  answerButtonView: {
    margin: 30,
    height: 75,
    width: 250,
    backgroundColor: 'aliceblue',
    borderWidth: 1,
    borderColor: 'gray',
    justifyContent: 'center',
  },
  inputVoiceButtonView: {
    margin: 30,
    height: 75,
    width: 250,
    backgroundColor: 'aliceblue',
    borderWidth: 1,
    borderColor: 'gray',
    justifyContent: 'center',
  },
  textArea: {
    fontSize: 18,
    margin: 30,
    height: 100,
    width: 250,
    backgroundColor: 'lightgray',
    borderWidth: 1,
    borderColor: 'gray',
    justifyContent: 'center',
  }
});

export default App;
