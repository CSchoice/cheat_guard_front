// src/services/cameraService.js

class CameraService {
  constructor() {
    this.stream = null;
  }

  /**
   * videoElement: HTMLVideoElement
   * deviceId (optional): 특정 카메라 deviceId
   */
  async startCamera(videoElement, deviceId = null) {
    if (!videoElement) {
      throw new Error('비디오 요소가 제공되지 않았습니다.');
    }
    if (!(videoElement instanceof HTMLVideoElement)) {
      throw new Error('유효한 비디오 요소가 아닙니다.');
    }

    // 비디오 제약(constraints) 설정
    const videoConstraints = {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      frameRate: { ideal: 15 },
      ...(deviceId
        ? { deviceId: { exact: deviceId } }    // 선택된 deviceId 사용
        : { facingMode: 'user' }               // 기본은 전면 카메라
      ),
    };

    try {
      // 이전 스트림이 있으면 정리
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
      }

      this.stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false,
      });

      // videoElement에 스트림 연결
      videoElement.srcObject = this.stream;

      // 메타데이터 로드 후 재생
      return new Promise((resolve, reject) => {
        const cleanup = () => {
          videoElement.onloadedmetadata = null;
          videoElement.onerror = null;
        };

        videoElement.onloadedmetadata = () => {
          videoElement.play()
            .then(() => {
              cleanup();
              resolve(true);
            })
            .catch(err => {
              cleanup();
              console.error('비디오 재생 오류:', err);
              reject(new Error('비디오를 재생할 수 없습니다.'));
            });
        };

        // 안전장치: 1초 후에도 metadata 이벤트가 없으면 play 시도
        const timeout = setTimeout(() => {
          videoElement.play()
            .then(() => {
              cleanup();
              resolve(true);
            })
            .catch(err => {
              cleanup();
              console.error('비디오 재생 오류 (타임아웃):', err);
              reject(new Error('비디오를 재생할 수 없습니다.'));
            });
        }, 1000);

        videoElement.onerror = err => {
          clearTimeout(timeout);
          cleanup();
          console.error('비디오 요소 오류:', err);
          reject(new Error('비디오 요소에서 오류가 발생했습니다.'));
        };
      });
    } catch (err) {
      console.error('카메라 접근 오류:', err);
      throw new Error('카메라에 접근할 수 없습니다. 권한을 확인해주세요.');
    }
  }

  /** 현재 스트림에서 프레임을 JPEG Blob으로 캡처 */
  async captureFrame() {
    if (!this.stream) {
      console.error('No video stream available');
      return null;
    }
    const videoTrack = this.stream.getVideoTracks()[0];
    if (!videoTrack) {
      console.error('No video track available');
      return null;
    }

    try {
      // ImageCapture API 우선 사용
      if (window.ImageCapture) {
        const imageCapture = new ImageCapture(videoTrack);
        const bitmap = await imageCapture.grabFrame();
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bitmap, 0, 0);

        return new Promise(resolve => {
          canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.8);
        });
      } else {
        // 대체: videoElement 없이 직접 캡처
        const video = document.createElement('video');
        video.srcObject = this.stream;
        await video.play();

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);

        return new Promise(resolve => {
          canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.8);
        });
      }
    } catch (err) {
      console.error('프레임 캡처 오류:', err);
      return null;
    }
  }

  /** 카메라 스트림 정리 */
  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }
}

export default CameraService;
