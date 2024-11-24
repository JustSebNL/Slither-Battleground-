import { EventData, Page, GestureEventData } from '@nativescript/core';
import { GameViewModel } from './game-view-model';

let viewModel: GameViewModel;
let joystickArea: any;
let isDragging = false;
let startX = 0;
let startY = 0;

export function onNavigatingTo(args: EventData) {
    const page = <Page>args.object;
    viewModel = new GameViewModel();
    page.bindingContext = viewModel;

    // Initialize joystick
    joystickArea = page.getViewById('joystickArea');
    setupJoystick();
}

function setupJoystick() {
    joystickArea.on('touch', (args: GestureEventData) => {
        if (args.action === 'down') {
            isDragging = true;
            startX = args.getX();
            startY = args.getY();
        } else if (args.action === 'up') {
            isDragging = false;
        } else if (args.action === 'move' && isDragging) {
            const deltaX = args.getX() - startX;
            const deltaY = args.getY() - startY;
            
            // Normalize values between -1 and 1
            const radius = joystickArea.getMeasuredWidth() / 2;
            const normalizedX = Math.max(-1, Math.min(1, deltaX / radius));
            const normalizedY = Math.max(-1, Math.min(1, deltaY / radius));
            
            viewModel.updateJoystick(normalizedX, normalizedY);
        }
    });
}