package com.footballdetective.app;

import android.content.Context;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;
import android.view.HapticFeedbackConstants;
import android.view.View;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Crisp, short haptics instead of buzzy vibrations.
 * Order of preference: the motor's tuned primitives (Android 11+, on phones that support them),
 * then the predefined click effects (Android 10+), then the system's own UI haptics.
 */
@CapacitorPlugin(name = "CrispHaptics")
public class CrispHapticsPlugin extends Plugin {

    private Vibrator vibrator() {
        Context ctx = getContext();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            VibratorManager vm = (VibratorManager) ctx.getSystemService(Context.VIBRATOR_MANAGER_SERVICE);
            return vm != null ? vm.getDefaultVibrator() : null;
        }
        return (Vibrator) ctx.getSystemService(Context.VIBRATOR_SERVICE);
    }

    @PluginMethod
    public void play(PluginCall call) {
        String kind = call.getString("kind", "light");
        try {
            if (!playComposition(kind) && !playPredefined(kind)) playViewHaptic(kind);
        } catch (Exception ignored) {
            // Haptics are a nicety; never fail the call.
        }
        call.resolve();
    }

    /** Android 11+: tuned primitives such as a crisp click or a soft tick. */
    private boolean playComposition(String kind) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) return false;
        Vibrator v = vibrator();
        if (v == null || !v.hasVibrator()) return false;
        int click = VibrationEffect.Composition.PRIMITIVE_CLICK;
        int tick = VibrationEffect.Composition.PRIMITIVE_TICK;
        int thud = VibrationEffect.Composition.PRIMITIVE_THUD;
        if (!v.areAllPrimitivesSupported(click, tick)) return false;
        VibrationEffect.Composition c = VibrationEffect.startComposition();
        switch (kind) {
            case "selection":
                c.addPrimitive(tick, 0.5f);
                break;
            case "light":
                c.addPrimitive(click, 0.45f);
                break;
            case "medium":
                c.addPrimitive(click, 0.8f);
                break;
            case "success":
                c.addPrimitive(click, 0.6f);
                c.addPrimitive(click, 1.0f, 70);
                break;
            case "warning":
                c.addPrimitive(tick, 0.9f);
                c.addPrimitive(tick, 0.9f, 60);
                break;
            case "error":
                if (v.areAllPrimitivesSupported(thud)) c.addPrimitive(thud, 0.8f);
                else c.addPrimitive(click, 1.0f);
                c.addPrimitive(click, 0.7f, 90);
                break;
            default:
                c.addPrimitive(click, 0.5f);
        }
        v.vibrate(c.compose());
        return true;
    }

    /** Android 10+: predefined click effects, still much crisper than a raw vibration. */
    private boolean playPredefined(String kind) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) return false;
        Vibrator v = vibrator();
        if (v == null || !v.hasVibrator()) return false;
        int effect;
        switch (kind) {
            case "selection":
                effect = VibrationEffect.EFFECT_TICK;
                break;
            case "medium":
            case "warning":
                effect = VibrationEffect.EFFECT_CLICK;
                break;
            case "success":
            case "error":
                effect = VibrationEffect.EFFECT_DOUBLE_CLICK;
                break;
            default:
                effect = VibrationEffect.EFFECT_TICK;
        }
        v.vibrate(VibrationEffect.createPredefined(effect));
        return true;
    }

    /** Older phones: the same haptics Android uses for its own buttons. */
    private void playViewHaptic(String kind) {
        View view = getBridge().getWebView();
        if (view == null) return;
        int constant;
        switch (kind) {
            case "success":
                constant = Build.VERSION.SDK_INT >= Build.VERSION_CODES.R ? HapticFeedbackConstants.CONFIRM : HapticFeedbackConstants.VIRTUAL_KEY;
                break;
            case "error":
            case "warning":
                constant = Build.VERSION.SDK_INT >= Build.VERSION_CODES.R ? HapticFeedbackConstants.REJECT : HapticFeedbackConstants.LONG_PRESS;
                break;
            case "selection":
                constant = HapticFeedbackConstants.CLOCK_TICK;
                break;
            default:
                constant = HapticFeedbackConstants.KEYBOARD_TAP;
        }
        getActivity().runOnUiThread(() -> view.performHapticFeedback(constant));
    }
}
