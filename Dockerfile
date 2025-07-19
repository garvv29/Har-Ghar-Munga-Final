FROM openjdk:11-jdk

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs

# Install Android SDK
ENV ANDROID_HOME=/opt/android-sdk
ENV PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools

RUN mkdir -p $ANDROID_HOME && cd $ANDROID_HOME
RUN wget -q https://dl.google.com/android/repository/commandlinetools-linux-8512546_latest.zip
RUN unzip commandlinetools-linux-8512546_latest.zip
RUN rm commandlinetools-linux-8512546_latest.zip

# Install Android SDK components
RUN yes | $ANDROID_HOME/cmdline-tools/bin/sdkmanager --licenses
RUN $ANDROID_HOME/cmdline-tools/bin/sdkmanager "platform-tools" "platforms;android-35" "build-tools;35.0.0"

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Bundle React Native
RUN npx react-native bundle --platform android --dev false --entry-file index.ts --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

# Build APK
WORKDIR /app/android
RUN ./gradlew assembleRelease

# Copy APK to output
RUN cp app/build/outputs/apk/release/app-release.apk /app/har-ghar-munga.apk

WORKDIR /app
CMD ["ls", "-la", "har-ghar-munga.apk"] 